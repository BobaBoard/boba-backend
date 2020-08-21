import debug from "debug";
import express from "express";
// import {
//   postNewContribution,
//   postNewComment,
//   postNewCommentChain,
// } from "./queries";
import { isLoggedIn } from "../auth-handler";
// import {
//   makeServerPost,
//   makeServerComment,
//   ensureNoIdentityLeakage,
// } from "../response-utils";

const info = debug("bobaserver:posts:routes-info");
const log = debug("bobaserver:posts:routes-log");
const error = debug("bobaserver:posts:routes-error");

const router = express.Router();

router.post("/:collectionId/", async (req, res) => {
  const { collectionId } = req.params;
  res.status(200).json({ contribution: null });
});

router.post("/:collectionId/updates/new", isLoggedIn, async (req, res) => {
  const { collectionId } = req.params;
  res.status(200).json({ contribution: null });
});

router.post("/:collectionId/updates/all", isLoggedIn, async (req, res) => {
  const { collectionId } = req.params;
  res.status(200).json({ contribution: null });
});

router.post("/new", isLoggedIn, async (req, res) => {
  res.status(200).json({ contribution: null });
});

router.post("/:collectionId/thread/new", isLoggedIn, async (req, res) => {
  const { collectionId } = req.params;
  res.status(200).json({ contribution: null });
});
