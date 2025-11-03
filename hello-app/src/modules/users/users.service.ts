import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';

interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    createdAt: Date;
}

@Injectable()
export class UsersService {
    private readonly dataPath = path.join(__dirname, '..', '..', 'data', 'users.json');

    private readData(): User[] {
        try {
            const data = fs.readFileSync(this.dataPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    private writeData(users: User[]): void {
        fs.writeFileSync(this.dataPath, JSON.stringify(users, null, 2));
    }

    async create(userData: Partial<User>): Promise<User> {
        const users = this.readData();
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const hashedPassword = await bcrypt.hash(userData.password!, 10);
        
        const newUser: User = {
            id: newId,
            username: userData.username!,
            email: userData.email!,
            password: hashedPassword,
            createdAt: new Date(),
        };
        
        users.push(newUser);
        this.writeData(users);
        return newUser;
    }

    async findByEmail(email: string): Promise<User | null> {
        const users = this.readData();
        const user = users.find(u => u.email === email);
        return user || null;
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.findByEmail(email);
        if (!user) {
            return null;
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
            return user;
        }
        return null;
    }
}
