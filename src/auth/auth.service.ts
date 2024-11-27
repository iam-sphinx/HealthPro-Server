import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BcryptService } from 'src/bcrypt/bcrypt.service';
import { UserService } from 'src/user/user.service';
import { AuthDto } from './dto/auth.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
  ) {}

  async signup(authDto: AuthDto) {
    const user = await this.userService.findOne(authDto.username);
    if (user) {
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    }

    const hashedPass = await this.bcryptService.createHash(authDto.password);
    const newUser = await this.userService.create({
      password: hashedPass,
      username: authDto.username,
    });

    const result = await this.signJwtToken(newUser);
    return result;
  }

  async signin(authDto: AuthDto) {
    const validUser = await this.validateUser(authDto);
    if (!validUser) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const result = await this.signJwtToken(validUser);
    return result;
  }

  async validateUser(authDto: AuthDto): Promise<any> {
    const user = await this.userService.findOne(authDto.username);

    if (
      user &&
      (await this.bcryptService.compareHash(authDto.password, user.password))
    ) {
      const { password, ...rest } = user;
      return rest;
    }

    return null;
  }

  async signJwtToken(user: User) {
    const payload = { username: user.username, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
    };
  }
}
