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
  phaseId: string
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
  accessTokenValue?: string
  accessTokenUri?: string
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
    // 🔹 Buscar el proyecto principal
    const snapshot = await db
      .collection('projects')
      .where('id', '==', projectCustomId)
      .get()

    if (snapshot.empty) {
      throw new Error(`Proyecto con id ${projectCustomId} no encontrado`)
    }

    const projectDoc = snapshot.docs[0].ref
    const now = new Date().toISOString()

    // 🔹 Crear la nueva phase
    const newPhase: ProjectPhase = {
      ...phase,
      id: `phs_${uuidv4()}`,
      createdAt: now,
      updatedAt: now
    }

    // 🔹 Guardar como subdocumento dentro del proyecto
    await db.collection('phases').doc(newPhase.id).set(newPhase)

    // 🔹 Actualizar metadata del proyecto
    await projectDoc.update({
      phases: FieldValue.arrayUnion(newPhase),
      updatedAt: now
    })

    return newPhase
  }

  public static async createRequire (
    projectId: string,
    phaseId: string,
    requireData: Omit<
      Require,
      'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'phaseId'
    >
  ): Promise<Require> {
    const snapshot = await db
      .collection('projects')
      .where('id', '==', projectId)
      .get()
    if (snapshot.empty) {
      throw new Error(`Proyecto con id ${projectId} no encontrado`)
    }

    const projectDoc = snapshot.docs[0]
    const projectData = projectDoc.data()
    const now = new Date().toISOString()

    // ✅ Crear el objeto Require completo
    const newRequire: Require = {
      ...requireData,
      id: `req_${uuidv4()}`,
      projectId,
      phaseId,
      proofs: [],
      transactions: [],
      progress: 0,
      status: 'active',
      createdAt: now,
      updatedAt: now
    }

    // ✅ Guardar el require en su colección global
    await db.collection('requires').doc(newRequire.id).set(newRequire)

    // ✅ Actualizar la fase dentro del proyecto agregando solo el id del require
    const updatedPhases = (projectData.phases || []).map((phase: any) => {
      if (phase.id === phaseId) {
        const existingRequires = phase.requires || []
        return {
          ...phase,
          requires: [...existingRequires, newRequire.id],
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

  public static async createTransaction (
    txData: Omit<Transaction, 'id' | 'timestamp'>
  ): Promise<Transaction> {
    const { requireId } = txData

    // Verificar que el require exista
    const requireSnapshot = await db
      .collection('requires')
      .where('id', '==', requireId)
      .get()
    if (requireSnapshot.empty) {
      throw new Error(`Require con id ${requireId} no encontrado`)
    }

    const requireDoc = requireSnapshot.docs[0]
    const requireRef = requireDoc.ref
    const requireData = requireDoc.data()
    const now = new Date().toISOString()

    // Crear la transacción
    const newTx: Transaction = {
      ...txData,
      id: `txn_${uuidv4()}`,
      timestamp: now
    }

    // Guardar la transacción en su colección global
    await db.collection('transactions').doc(newTx.id).set(newTx)

    // Agregar el id de la transacción dentro del require correspondiente
    const updatedTransactions = [...(requireData.transactions || []), newTx.id]
    await requireRef.update({
      transactions: updatedTransactions,
      updatedAt: now
    })

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
  // 1️⃣ Traer todos los proyectos
  public static async getAllProjects (): Promise<any[]> {
    try {
      const snapshot = await db.collection('projects').get()
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (error) {
      console.error('Error obteniendo proyectos:', error)
      throw new Error('Error obteniendo proyectos')
    }
  }

  // 2️⃣ Traer todas las phases por projectId
  public static async getPhasesByProject (projectId: string): Promise<any[]> {
    try {
      const projectSnapshot = await db
        .collection('projects')
        .where('id', '==', projectId)
        .get()
      if (projectSnapshot.empty) {
        throw new Error(`Require con id ${projectId} no encontrado`)
      }
      const projectDoc = projectSnapshot.docs[0]
      return projectDoc.data().phases || []
    } catch (error) {
      console.error('Error obteniendo phases por proyecto:', error)
      throw new Error('Error obteniendo phases por proyecto')
    }
  }

  // 3️⃣ Traer una phase específica por phaseId (dentro de un projectId)
  public static async getPhaseById (phaseId: string): Promise<any> {
    try {
      // 🔹 Buscar el documento en la colección 'phases' usando el id personalizado
      const snapshot = await db
        .collection('phases')
        .where('id', '==', phaseId)
        .get()

      if (snapshot.empty) {
        throw new Error(`Phase con id ${phaseId} no encontrada`)
      }

      // 🔹 Retornar el primer resultado encontrado
      const doc = snapshot.docs[0]
      return { id: doc.id, ...doc.data() }
    } catch (error) {
      console.error('Error obteniendo phase por ID:', error)
      throw new Error('Error obteniendo phase por ID')
    }
  }

  // 🔹 Obtener todos los requires de un proyecto
  public static async getRequiresByProjectId (
    projectId: string
  ): Promise<Require[]> {
    const snapshot = await db
      .collection('requires')
      .where('projectId', '==', projectId)
      .get()
    if (snapshot.empty) return []
    return snapshot.docs.map(doc => doc.data() as Require)
  }

  // 🔹 Obtener todos los requires de una fase
  public static async getRequiresByPhaseId (
    phaseId: string
  ): Promise<Require[]> {
    const snapshot = await db
      .collection('requires')
      .where('phaseId', '==', phaseId)
      .get()
    if (snapshot.empty) return []
    return snapshot.docs.map(doc => doc.data() as Require)
  }

  // 🔹 Obtener require por su ID
  public static async getRequireById (
    requireId: string
  ): Promise<Require | null> {
    const docRef = db.collection('requires').doc(requireId)
    const doc = await docRef.get()
    if (!doc.exists) return null
    return doc.data() as Require
  }
}
