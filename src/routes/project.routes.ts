import { Router } from 'express'
import ProjectController from '../controllers/project.controller.js'

const router = Router()


// Proyectos
router.post('/', ProjectController.createProject)
router.post('/:projectId/participants', ProjectController.addParticipant)
router.post('/:projectId/phases', ProjectController.addPhase)

// Requires, Transactions, Proofs
router.post('/:projectId/phases/:phaseId/requires', ProjectController.createRequire)
router.post('/transactions', ProjectController.createTransaction)
router.post('/proofs', ProjectController.createProof)

export default router
