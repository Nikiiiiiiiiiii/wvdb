import { Body, Controller, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AddToBasketDto } from './dto/add-to-basket.dto';
import { SelectPickpointDto } from './dto/select-pickpoint.dto';
import { SelectPaymentDto } from './dto/selectPayment.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('addToBasket')
  async addToBasket(@Body() addToBasketDto: AddToBasketDto): Promise<void> {
    await this.appService.addToBasket(addToBasketDto);
  }

  @Post('selectPickpoint')
  async selectPickpoint(@Body() selectPickpointDto: SelectPickpointDto): Promise<void> {
    await this.appService.selectPickpoint(selectPickpointDto);
  }

  @Post('selectPayment')
  async selectPayment(@Body() selectPaymentDto: SelectPaymentDto): Promise<void> {
    await this.appService.selectPayment(selectPaymentDto);
  }

  @Post('createOrder/:token')
  async createOrder(@Param('token') token: string): Promise<any> {
    return this.appService.createOrder(token);
  }
}
