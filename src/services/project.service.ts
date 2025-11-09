import { v4 as uuidv4 } from 'uuid'
import { db, FieldValue } from '../config/firestore.js'

export interface Participant {
  userId: string
  rol: string
}

export interface Budget {
  total: number
  currency: string
}

export interface ProjectPhase {
  id: string
  name: string
  description?: string
  order?: number
  status?: string
  requires?: string[] // IDs de Requires
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  title: string
  description: string
  ownerId: string
  participants?: Participant[]
  budget: Budget
  phases?: ProjectPhase[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface Require {
  id: string
  projectId: string
  name: string
  description: string
  proofs?: string[]
  transactions?: string[]
  supplier: string
  cost: { amount: number; currency: string }
  progress: number
  status: string
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  requireId: string
  fromWallet: { interledgerAddress: string; userId: string }
  toWallet: { interledgerAddress: string; userId: string }
  amount: number
  currency: string
  provider: string
  reference: string
  status: string
  timestamp: string
}

export interface ProofAttachment {
  type: string
  url: string
}

export interface Proof {
  id: string
  requireId: string
  submittedBy: string
  phaseId: string
  description: string
  attachments?: ProofAttachment[]
  verificationNotes?: string
  status: string
  submittedAt: string
  verifiedAt?: string
}

export default class ProjectService {
  // Crear proyecto
  public static async createProject (
    data: Omit<Project, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<Project> {
    const projectRef = db.collection('projects').doc()
    const now = new Date().toISOString()
    const newProject: Project = {
      ...data,
      id: `prj_${uuidv4()}`,
      status: 'active',
      participants: data.participants || [],
      phases: data.phases || [],
      createdAt: now,
      updatedAt: now
    }

    await projectRef.set(newProject)
    return newProject
  }

  // Agregar participante
  public static async addParticipant (
    projectId: string,
    participant: Participant
  ): Promise<void> {
    const snapshot = await db
      .collection('projects')
      .where('id', '==', projectId)
      .get()

    if (snapshot.empty) {
      throw new Error(`Proyecto con id ${projectId} no encontrado`)
    }

    const projectDoc = snapshot.docs[0].ref

    await projectDoc.update({
      participants: FieldValue.arrayUnion(participant),
      updatedAt: new Date().toISOString()
    })
  }

  public static async addPhase (
    projectCustomId: string,
    phase: Omit<ProjectPhase, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ProjectPhase> {
    // Buscar el proyecto por su id personalizado
    const snapshot = await db
      .collection('projects')
      .where('id', '==', projectCustomId)
      .get()

    if (snapshot.empty) {
      throw new Error(`Proyecto con id ${projectCustomId} no encontrado`)
    }

    const projectDoc = snapshot.docs[0].ref
    const now = new Date().toISOString()

    const newPhase: ProjectPhase = {
      ...phase,
      id: `phs_${uuidv4()}`,
      createdAt: now,
      updatedAt: now
    }

    await projectDoc.update({
      phases: FieldValue.arrayUnion(newPhase),
      updatedAt: now
    })

    return newPhase
  }

public static async createRequire(
    projectCustomId: string,
    phaseId: string,
    requireData: Omit<Require, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Require> {
    const snapshot = await db.collection('projects').where('id', '==', projectCustomId).get()
    if (snapshot.empty) {
      throw new Error(`Proyecto con id ${projectCustomId} no encontrado`)
    }

    const projectDoc = snapshot.docs[0]
    const projectData = projectDoc.data()
    const now = new Date().toISOString()

    // ✅ Generar nuevo Require
    const newRequire: Require = {
      ...requireData,
      id: `req_${uuidv4()}`,
      proofs: [],
      transactions: [],
      progress: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now
    }

    // ✅ Guardar en colección global
    await db.collection('requires').doc(newRequire.id).set(newRequire)

    // ✅ Actualizar la fase correspondiente dentro del proyecto
    const updatedPhases = (projectData.phases || []).map((phase: any) => {
      if (phase.id === phaseId) {
        const existingRequires = phase.requires || []
        return {
          ...phase,
          requires: [...existingRequires, newRequire],
          updatedAt: now
        }
      }
      return phase
    })

    await projectDoc.ref.update({
      phases: updatedPhases,
      updatedAt: now
    })

    return newRequire
  }

public static async createTransaction(
    txData: Omit<Transaction, 'id' | 'timestamp'> & { projectId: string; phaseId?: string; requireId: string }
  ): Promise<Transaction> {
    const { projectId, phaseId, requireId } = txData
    // Buscar proyecto
    const projectSnapshot = await db.collection('projects').where('id', '==', projectId).get()
    if (projectSnapshot.empty) {
      throw new Error(`Proyecto con id ${projectId} no encontrado`)
    }

    const projectDoc = projectSnapshot.docs[0]
    const projectRef = projectDoc.ref
    const projectData = projectDoc.data()

    // Buscar fase dentro del proyecto
    const phaseIndex = projectData.phases?.findIndex((p: any) => p.id === phaseId)
    if (phaseIndex === -1 || phaseIndex === undefined) {
      throw new Error(`Fase con id ${phaseId} no encontrada en el proyecto ${projectId}`)
    }

    // Buscar require dentro de la fase
    const phase = projectData.phases[phaseIndex]
    const requireIndex = phase.requires?.findIndex((r: any) => r.id === requireId)
    if (requireIndex === -1 || requireIndex === undefined) {
      throw new Error(`Require con id ${requireId} no encontrado en la fase ${phaseId}`)
    }

    // Crear transacción
    const newTx: Transaction = {
      ...txData,
      id: `txn_${uuidv4()}`,
      requireId,
      timestamp: new Date().toISOString()
    }

    // Agregar transacción dentro del require
    const updatedProject = { ...projectData }
    updatedProject.phases[phaseIndex].requires[requireIndex].transactions = [
      ...(phase.requires[requireIndex].transactions || []),
      newTx
    ]

    updatedProject.updatedAt = new Date().toISOString()

    // Guardar cambios
    await projectRef.update(updatedProject)

    return newTx
  }

  // Crear Proof
  public static async createProof (
    proofData: Omit<Proof, 'id' | 'submittedAt'>
  ): Promise<Proof> {
    const proofRef = db.collection('proofs').doc()
    const now = new Date().toISOString()
    const newProof: Proof = {
      ...proofData,
      id: `prf_${uuidv4()}`,
      submittedAt: now
    }
    await proofRef.set(newProof)
    return newProof
  }
}
