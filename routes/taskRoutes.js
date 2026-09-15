const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { idParamValidator } = require("../validators/commonValidators");
const { createTaskValidator, updateTaskValidator } = require("../validators/taskValidators");
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} = require("../controllers/taskController");

router.use(authMiddleware);

router.get("/", listTasks);
router.get("/:id", idParamValidator, validate, getTask);
router.post("/", createTaskValidator, validate, createTask);
router.put("/:id", idParamValidator, updateTaskValidator, validate, updateTask);
router.patch("/:id/complete", idParamValidator, validate, completeTask);
router.delete("/:id", idParamValidator, validate, deleteTask);

module.exports = router;