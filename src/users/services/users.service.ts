import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOne(name: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { name } });
  }

  async createOne({ name, password }: Partial<User>): Promise<User> {
    const id = v4();
    const newUser = this.userRepository.create({ id, name, password });

    return await this.userRepository.save(newUser);
  }
}
