import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm'
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async create(user: Partial<User>): Promise<User> {
        const newUser = this.usersRepository.create(user);
        const hashedPassword = await bcrypt.hash(user.password, 10);
        newUser.password = hashedPassword;
        return this.usersRepository.save(newUser);
    }

    findByEmail(email: string) {
        const user = this.usersRepository.findOneBy({ email });
        return user;
    }

    async validateUser(email: string, password: string) {
        const user = await this.findByEmail(email);
        if (!user) {
            return null;
        }
        const status = await bcrypt.compareSync(password, user.password);
        if (status) {
            return user;
        }
        return null;
    }
}
