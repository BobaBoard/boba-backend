import {
  type BoardCategoryDescription,
  type BoardTextDescription,
} from "types/rest/boards.js";

export interface DbBoardTextDescription extends BoardTextDescription {
  categories: null;
}

export interface DbBoardCategoryDescription extends BoardCategoryDescription {
  description: null;
}
