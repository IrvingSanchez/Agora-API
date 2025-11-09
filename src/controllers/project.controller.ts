import { Request, Response } from 'express'
import ProjectService from '../services/project.service.js'
import { Participant, ProjectPhase } from '../services/project.service.js'

export default class ProjectController {
  // Crear proyecto
  public static async createProject(req: Request, res: Response) {
    try {
      const project = await ProjectService.createProject(req.body)
      res.status(201).json({ success: true, data: project })
    } catch (error) {
      console.error('Error creando proyecto:', error)
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  // Agregar participante a un proyecto
  public static async addParticipant(req: Request, res: Response) {
    try {
      const { projectId } = req.params
      const participant: Participant = req.body
      await ProjectService.addParticipant(projectId, participant)
      res.status(200).json({ success: true, message: 'Participante agregado exitosamente' })
    } catch (error) {
      console.error('Error agregando participante:', error)
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  // Agregar fase a un proyecto
  public static async addPhase(req: Request, res: Response) {
    try {
      const { projectId } = req.params
      const phase: ProjectPhase = req.body
      const newPhase = await ProjectService.addPhase(projectId, phase)
      res.status(200).json({ success: true, data: newPhase })
    } catch (error) {
      console.error('Error agregando fase:', error)
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  public static async createRequire(req: Request, res: Response): Promise<void> {
    try {
      const { projectId, phaseId } = req.params
      const requireData = req.body

      const newRequire = await ProjectService.createRequire(projectId, phaseId, requireData)
      res.status(201).json({
        message: 'Require creado correctamente',
        require: newRequire
      })
    } catch (error: any) {
      console.error('Error creando require:', error)
      res.status(500).json({
        error: 'Error creando require',
        details: error.message
      })
    }
  }

public static async createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const { projectId, phaseId, requireId } = req.params
    const txData = { ...req.body, projectId, phaseId, requireId }
    const newTx = await ProjectService.createTransaction(txData)
    res.status(201).json({ message: 'Transaction creada correctamente', transaction: newTx })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

  // Crear Proof
  public static async createProof(req: Request, res: Response) {
    try {
      const proof = await ProjectService.createProof(req.body)
      res.status(201).json({ success: true, data: proof })
    } catch (error) {
      console.error('Error creating proof:', error)
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  }
}
