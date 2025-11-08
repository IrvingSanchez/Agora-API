import fs from "fs-extra";

const USERS_FILE = "./Users.json";

export const readUsersFile = async (): Promise<any[]> => {
  try {
    const exists = await fs.pathExists(USERS_FILE);
    if (!exists) return [];
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading Users.json:", error);
    return [];
  }
};

export const writeUsersFile = async (users: any[]): Promise<void> => {
  try {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing Users.json:", error);
  }
};
