import { v4 as uuidv4 } from "uuid";
import { db } from "../config/firebase.config.js";

export interface UserInput {
  name: { first: string; last: string };
  email: string;
  phone: string;
  wallet: { currency: string; provider: string };
}

export interface User {
  id: string;
  name: { first: string; last: string };
  email: string;
  phone: string;
  wallet: {
    interledgerAddress: string | null;
    publicKey: string | null;
    currency: string;
    provider: string;
    balance: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default class UserService {
    private static usersRef = db.ref('users');

    public static async registerUsers(data: UserInput): Promise<User> {
        const newUser: User = {
            id: `usr_${uuidv4()}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            wallet: {
                interledgerAddress: null,
                publicKey: null,
                currency: data.wallet.currency,
                provider: data.wallet.provider,
                balance: 0,
            },
            status: "active",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        await this.usersRef.child(newUser.id).set(newUser);
        return newUser;
    }

    public static async getUserById(userId: string): Promise<User | null> {
        const snapshot = await this.usersRef.child(userId).get();
        return snapshot.exists() ? snapshot.val() : null;
    }

    public static async getAllUsers(): Promise<User[]> {
        const snapshot = await this.usersRef.get();
        return snapshot.exists() ? Object.values(snapshot.val()) : [];
    }

    public static async updateUser(userId: string, data: Partial<UserInput>): Promise<User | null> {
        const user = await this.getUserById(userId);
        if (!user) return null;

        const updatedUser: User = {
            ...user,
            ...data,
            wallet: data.wallet ? {
                ...user.wallet,
                ...data.wallet
            } : user.wallet,
            updatedAt: new Date().toISOString()
        };

        await this.usersRef.child(userId).update(updatedUser);
        return updatedUser;
    }

    public static async deleteUser(userId: string): Promise<boolean> {
        const user = await this.getUserById(userId);
        if (!user) return false;

        await this.usersRef.child(userId).remove();
        return true;
    }

    public static async listenToUserChanges(userId: string, callback: (user: User | null) => void): Promise<() => void> {
        const userRef = this.usersRef.child(userId);
        
        userRef.on('value', (snapshot) => {
            callback(snapshot.exists() ? snapshot.val() : null);
        });

        // Retorna una función para dejar de escuchar cambios
        return () => userRef.off();
    }
}
