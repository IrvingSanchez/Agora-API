import { Request, Response } from 'express'
import UserService from '../services/user.service.js'

export default class UserController {
  static async registerUser (req: Request, res: Response): Promise<void> {
    try {
      const output = await UserService.registerUsers(req.body)
      res.status(200).json({ message: 'Comando ejecutado con éxito', output })
    } catch (error: any) {
      res
        .status(500)
        .json({ message: 'Error al ejecutar el comando', error: error.message })
    }
  }

  public static async getUsers (_req: Request, res: Response): Promise<void> {
    try {
      const users = await UserService.getAllUsers()
      res.status(200).json({ success: true, data: users })
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message })
    }
  }

  public static async updateWallet  (req: Request, res: Response): Promise<void> {
  try {
    const { userId } = req.params
    const walletData = req.body

    const updatedUser = await UserService.updateUserWallet(userId, walletData)

    res.status(200).json({
      message: 'Wallet del usuario actualizada exitosamente',
      data: updatedUser
    })
  } catch (error: any) {
    res.status(400).json({
      error: true,
      message: error.message || 'Error al actualizar la wallet'
    })
  }
}
}
