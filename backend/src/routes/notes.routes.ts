import express from 'express';
import notesController from '../controllers/notes.controller';
import verfiyToken from '../middlewares/auth.middleware';

const router = express.Router();


router.use(verfiyToken);

router.post('/', notesController.createNote);
router.get('/', notesController.getAllNotes);
router.get('/:id', notesController.getNoteById);
router.put('/:id', notesController.updateNote);
router.delete('/:id', notesController.deleteNote);

export default router;