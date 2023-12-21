import { Controller, Get, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginService } from './login.service';
import { Principal } from './models/principal.interface';

@ApiTags('rewards-board')
@Controller('rewards-board/login')
export class LoginController {
    private readonly logger = new Logger(LoginController.name);

    public constructor(private readonly _loginService: LoginService) {}

    @Get(':token')
    public login(@Param('token') token: string): Principal | null {
        this.logger.log('GET request received. Try to logged in with token=' + token + '...');
        const result = this._loginService.login(token);
        this.logger.log('Token=' + token + ' validated !. Welcome ' + result.name);

        return result;
    }
}
