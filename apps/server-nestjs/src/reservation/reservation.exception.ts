import { HttpStatus } from '@nestjs/common';
import { AppException } from '../app.exception';

export class ReservationIllegalStateException extends AppException {
  constructor() {
    super('找不到预约或预约状态不正确', HttpStatus.BAD_REQUEST);
  }
}
