import {
  BoardCategoryDescription,
  BoardTextDescription,
} from "types/rest/boards";

export interface DbBoardTextDescription extends BoardTextDescription {
  categories: null;
}

export interface DbBoardCategoryDescription extends BoardCategoryDescription {
  description: null;
}
