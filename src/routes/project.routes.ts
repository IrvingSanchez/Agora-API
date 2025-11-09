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
router.post('/all/', ProjectController.getAllProjects)
router.post('/:projectId/get-phases', ProjectController.getPhasesByProject)
router.post('/phases/:phaseId', ProjectController.getPhaseById)// pendiente
router.post('/requires/:projectId', ProjectController.getRequiresByProjectId)
router.post('/phase/:phaseId', ProjectController.getRequiresByPhaseId)
router.post('/require/:requireId', ProjectController.getRequireById)
// router.post('/proofs', ProjectController.createProof)

export default router
