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
      console.error('Error registering user:', error)
      throw new Error('Error registering user')
    }
  }
}
