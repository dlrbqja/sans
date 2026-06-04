import express from "express";
import { getMemos, getMemoById, createMemo, updateMemoById, deleteMemoById } from "../db.js";

const router = express.Router();
function sendSuccess(res, data, status = 200) {
  res.status(status).json({ success: true, data });
}

function sendError(res, message, status = 400) {
  res.status(status).json({ success: false, message });
}

function parseMemoId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizePinned(value) {
  return value === true || value === 1 || value === "1" ? 1 : 0;
}



router.get("/", (req, res) => {
  getMemos((err, rows) => {
    if (err) return sendError(res, "db error", 500);
    return sendSuccess(res, rows);
  });
});

router.post("/", (req, res) => {
  const title = req.body?.title?.trim();
  const content = typeof req.body?.content === "string" ? req.body.content : "";

  if (!title) {
    return sendError(res, "title is required", 400);
  }

  createMemo(title, content, (err, id) => {
    if (err) return sendError(res, "db error", 500);
    return sendSuccess(res, { id }, 201);
  });
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, content = '', pinned = false, image_url = null } = req.body;

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: 'invalid id' });
  }

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'title is required' });
  }

  updateMemoById(
    id,
    { title: title.trim(), content, pinned: Boolean(pinned), image_url },
    (err, changes) => {
      if (err) return res.status(500).json({ success: false, message: 'db error' });
      if (changes === 0) return res.status(404).json({ success: false, message: 'memo not found' });
      res.json({ success: true, data: { id, updated: changes } });
    }
  );
});

router.get("/:index", (req, res) => {
  const index = Number(req.params.index);
  if (!Number.isInteger(index) || index <= 0) {
    return sendError(res, "invalid index", 400);
  }

  getMemoById(index, (err, row) => {
    if (err) return sendError(res, "db error", 500);
    if (!row) return sendError(res, "memo not found", 404);
    return sendSuccess(res, row);
  });
});

router.delete("/:id", (req, res) => {
  const id = parseMemoId(req.params.id);
  if (!id) return sendError(res, "invalid id", 400);

  deleteMemoById(id, (err, changes) => {
    if (err) return sendError(res, "db error", 500);
    if (changes === 0) return sendError(res, "memo not found", 404);
    return sendSuccess(res, { id });
  });
});

export default router;