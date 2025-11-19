import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { hash, compare } from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const { email, password } = createUserDto;
    const exists = await this.repo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already in use');
    const hashed = await hash(password, 10); // cost 10 (≈ $2^{10}$ work factor)
    const user = this.repo.create({ email, password: hashed });
    const saved = await this.repo.save(user);
    // don't return password
    const { password: _, ...rest } = saved as any;
    return rest;
  }

  async findAll(): Promise<Partial<User>[]> {
    const users = await this.repo.find();
    return users.map(({ password, ...u }) => u);
  }

  async findOne(id: number): Promise<Partial<User>> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    const { password, ...rest } = user as any;
    return rest;
  }

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException();
    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 10);
    }
    Object.assign(user, updateUserDto);
    const saved = await this.repo.save(user);
    const { password, ...rest } = saved as any;
    return rest;
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { deleted: true };
  }
}
