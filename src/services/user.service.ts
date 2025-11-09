import { v4 as uuidv4 } from 'uuid'
import { readUsersFile, writeUsersFile } from '../utils/file.utils.js'
import { db } from '../config/firestore.js'

export interface UserInput {
  name: { first: string; last: string }
  email: string
  phone: string
  wallet: { currency: string; provider: string }
}

export interface User {
  id: string
  name: { first: string; last: string }
  email: string
  phone: string
  wallet: {
    interledgerAddress: string | null
    publicKey: string | null
    currency: string
    provider: string
    balance: number
  }
  status: string
  createdAt: string
  updatedAt: string
}

export interface WalletUpdateInput {
  interledgerAddress?: string | null
  publicKey?: string | null
  currency?: string
  provider?: string
  balance?: number
}

export default class UserService {
  public static async registerUsers (data: UserInput): Promise<User> {
    try {
      const users = await readUsersFile()
      const userRef = db.collection('users').doc()

      const newUser = {
        id: `usr_${uuidv4()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
        wallet: {
          interledgerAddress: null,
          publicKey: null,
          currency: data.wallet.currency,
          provider: data.wallet.provider,
          balance: 0
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      users.push(newUser)

      await writeUsersFile(users)
      await userRef.set(newUser)
      return newUser
    } catch (error) {
      console.error('Error registrando usuario:', error)
      throw new Error('Error registrando usuario')
    }
  }

  public static async getAllUsers (): Promise<User[]> {
    try {
      // Leer desde archivo local
      const usersFromFile = await readUsersFile()

      // Leer desde Firebase
      const snapshot = await db.collection('users').get()
      const usersFromDb: User[] = snapshot.docs.map(doc => doc.data() as User)

      // Combinar ambos (opcional, si quieres mantener consistencia)
      const allUsers = [...usersFromFile, ...usersFromDb]

      // Si quieres eliminar duplicados por id
      const uniqueUsersMap = new Map<string, User>()
      allUsers.forEach(user => uniqueUsersMap.set(user.id, user))

      return Array.from(uniqueUsersMap.values())
    } catch (error) {
      console.error('Error consultando usuarios:', error)
      throw new Error('Error consultando usuarios')
    }
  }

  public static async updateUserWallet(userId: string, walletData: WalletUpdateInput): Promise<User> {
    try {
      // 1️⃣ Leer usuarios locales
      const users = await readUsersFile()

      // 2️⃣ Buscar usuario localmente
      const userIndex = users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        throw new Error(`Usuario con id ${userId} no encontrado`)
      }

      // 3️⃣ Actualizar datos de wallet (solo los campos enviados)
      users[userIndex].wallet = {
        ...users[userIndex].wallet,
        ...walletData
      }
      users[userIndex].updatedAt = new Date().toISOString()

      // 4️⃣ Guardar cambios en archivo local
      await writeUsersFile(users)

      // 5️⃣ Actualizar en Firestore
      const userRef = db.collection('users').where('id', '==', userId)
      const snapshot = await userRef.get()
      if (snapshot.empty) {
        throw new Error(`Usuario con id ${userId} no encontrado en Firestore`)
      }

      const docId = snapshot.docs[0].id
      await db.collection('users').doc(docId).update({
        wallet: users[userIndex].wallet,
        updatedAt: users[userIndex].updatedAt
      })

      return users[userIndex]
    } catch (error) {
      console.error('Error actualizando wallet del usuario:', error)
      throw new Error('Error actualizando wallet del usuario')
    }
  }
}
