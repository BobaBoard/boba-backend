import pg, { QueryFile } from "pg-promise";
import path from "path";

const getBoardBySlug = `
    SELECT 
        boards.slug,
        boards.tagline,
        boards.avatar_reference_id,
        boards.settings,
        json_agg(json_build_object(
            'id', bds.id,
            'index', bds.index, 
            'title', bds.title,
            'description', bds.description,
            'type', bds.type,
            'categories', (
                SELECT json_agg(categories.category) 
                FROM board_description_sections 
                LEFT JOIN board_description_section_categories bdsc ON bds.id = bdsc.section_id
                LEFT JOIN categories ON bdsc.category_id = categories.id 
                WHERE board_description_sections.id = bds.id
                GROUP BY bds.id ))) as descriptions
    FROM boards
    LEFT JOIN board_description_sections bds ON bds.board_id = boards.id 
    WHERE boards.slug=$/board_slug/
    GROUP BY boards.id`;

const markBoardVisit = `
    INSERT INTO user_board_last_visits(user_id, board_id) VALUES (
        (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/),
        (SELECT id from boards WHERE boards.slug = $/board_slug/))
    ON CONFLICT(user_id, board_id) DO UPDATE 
        SET last_visit_time = DEFAULT
        WHERE user_board_last_visits.user_id = (SELECT id FROM users WHERE users.firebase_id = $/firebase_id/)
            AND user_board_last_visits.board_id = (SELECT id from boards WHERE boards.slug = $/board_slug/)`;

const deleteSectionCategories = `
    DELETE FROM board_description_section_categories bdsc 
    USING board_description_sections bds
    WHERE  
        bds.id = $/section_id/ AND 
        bds.id = bdsc.section_id AND 
        bds.board_id = (SELECT id from boards WHERE boards.slug = $/board_slug/) AND
        ($/category_names/ IS NULL OR bdsc.category_id IN (SELECT id FROM categories WHERE category = ANY($/category_names/)));`;

const deleteSection = `
    DELETE FROM board_description_sections bds
    WHERE  
        bds.id = $/section_id/ AND
        bds.board_id = (SELECT id from boards WHERE boards.slug = $/board_slug/);`;

const updateSection = `
    UPDATE board_description_sections bds
    SET
        title = $/title/,
        description = $/description/,
        index = $/index/
    FROM boards
    WHERE
        boards.id = bds.board_id 
        AND bds.board_id  = (SELECT id from boards WHERE boards.slug = $/board_slug/)
        AND bds.id = $/section_id/
    RETURNING *;
`;

const createSection = `
    INSERT INTO board_description_sections(board_id, title, description, index, type)
    VALUES(
        (SELECT id from boards WHERE boards.slug = $/board_slug/),
        $/title/,
        $/description/,
        $/index/,
        $/type/
    )
    RETURNING *;
`;

const pgInstance = pg();
const createAddCategoriesToFilterSectionQuery = (
  sectionId: number,
  categories: string[]
) => {
  const insertCategoryQuery = `
      INSERT INTO board_description_section_categories(section_id, category_id) 
      VALUES($/section_id/, (SELECT id FROM categories WHERE category = $/category/)) 
      RETURNING $/category/;`;
  return pgInstance.helpers.concat(
    categories.map((category) => ({
      query: insertCategoryQuery,
      values: {
        section_id: sectionId,
        category: category.toLowerCase(),
      },
    }))
  );
};

// TODO: fix return types so they are consistent
export default {
  getAllBoards: new QueryFile(path.join(__dirname, "all-boards.sql")),
  getBoardActivityBySlug: new QueryFile(
    path.join(__dirname, "board-activity-by-slug.sql")
  ),
  getBoardBySlug,
  markBoardVisit,
  deleteSectionCategories,
  deleteSection,
  updateSection,
  createSection,
  createAddCategoriesToFilterSectionQuery,
};
