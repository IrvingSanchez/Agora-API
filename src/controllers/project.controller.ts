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
      await ProjectService.addPhase(projectId, phase)
      res.status(200).json({ success: true, message: 'Fase agregada exitosamente' })
    } catch (error) {
      console.error('Error agregando fase:', error)
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  // Crear Require
  public static async createRequire(req: Request, res: Response) {
    try {
      const requireObj = await ProjectService.createRequire(req.body)
      res.status(201).json({ success: true, data: requireObj })
    } catch (error) {
      console.error('Error creating require:', error)
      res.status(500).json({ success: false, message: (error as Error).message })
    }
  }

  // Crear Transaction
  public static async createTransaction(req: Request, res: Response) {
    try {
      const tx = await ProjectService.createTransaction(req.body)
      res.status(201).json({ success: true, data: tx })
    } catch (error) {
      console.error('Error creating transaction:', error)
      res.status(500).json({ success: false, message: (error as Error).message })
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
