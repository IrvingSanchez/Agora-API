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

  // Crear Require
  public static async createRequire (
    requireData: Omit<Require, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Require> {
    const requireRef = db.collection('requires').doc()
    const now = new Date().toISOString()
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

    await requireRef.set(newRequire)
    return newRequire
  }

  // Crear Transaction
  public static async createTransaction (
    tx: Omit<Transaction, 'id' | 'timestamp'>
  ): Promise<Transaction> {
    const txRef = db.collection('transactions').doc()
    const now = new Date().toISOString()
    const newTx: Transaction = { ...tx, id: `txn_${uuidv4()}`, timestamp: now }
    await txRef.set(newTx)
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
