import { Injectable } from '@nestjs/common';
import { Principal } from './models/principal.interface';

const MATHIS: Principal = {
    token: 'b9TmtJUWntn6LSSWfI8j',
    name: 'Mathis',
    userId: 1,
};
const LILOU: Principal = {
    token: 'EIr2YjaVWD2thJVEAn02',
    name: 'Lilou',
    userId: 2,
};
const ANNE: Principal = {
    token: 'eFGhtuRLxKHodDZtJ0iy',
    name: 'Anne',
};
const FABIEN: Principal = {
    token: '1tep2WJpU5fjORAnSXiE',
    name: 'Fabien',
};

const _principals: Principal[] = [MATHIS, LILOU, ANNE, FABIEN];

@Injectable()
export class LoginService {
    public login(token: string): Principal | null {
        const result = _principals.filter((principal) => principal.token === token);
        return result.length > 0 ? result[0] : null;
    }
}
