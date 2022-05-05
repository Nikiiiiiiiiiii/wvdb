import { HttpStatus, Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { AddToBasketDto } from './dto/add-to-basket.dto';

import * as FormData from 'form-data';
import { firstValueFrom, map } from 'rxjs';
import { SelectPickpointDto } from './dto/select-pickpoint.dto';
import { SelectPaymentDto } from './dto/selectPayment.dto';

@Injectable()
export class AppService {
  private characteristicId: number; // Вместо БД
  private addressId: number;
  private paymentId: number;
  private price: number;

  constructor(private httpService: HttpService) {}
  async addToBasket(addToBasketDto: AddToBasketDto): Promise<void> {
    const bodyFormData = new FormData();

    bodyFormData.append(`cod1S`, addToBasketDto.id);

    const products = await firstValueFrom(
      this.httpService
        .get(
          `https://wbxcatalog-ru.wildberries.ru/nm-2-card/catalog?spp=13&regions=68,64,83,4,38,80,33,70,82,86,75,30,69,48,22,1,66,31,40,71&stores=117673,122258,122259,125238,125239,125240,6159,124731,507,3158,117501,120602,6158,120762,121709,130744,159402,2737,117986,1733,686,132043&pricemarginCoeff=1.0&reg=1&appType=1&emp=0&locale=ru&lang=ru&curr=rub&couponsGeo=2,12,3,18,15,21&dest=-1029256,-51490,12358256&nm=${addToBasketDto.id}`,
          {
            headers: {
              // 'Content-Type': `multipart/form-data; boundary=${bodyFormData.getBoundary()}`,
              Cookie: `WILDAUTHNEW_V3=${addToBasketDto.token};`,
            },
          },
        )
        .pipe(map((response) => response.data.data.products)),
    );

    this.price = products[0].extended.clientPriceU / 100;

    this.characteristicId = products[0].sizes[0].optionId;

    bodyFormData.append(`characteristicId`, this.characteristicId);
    bodyFormData.append(`quantity`, 1);

    await firstValueFrom(
      this.httpService.post(
        `https://www.wildberries.ru/product/addtobasket`,
        bodyFormData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${bodyFormData.getBoundary()}`,
            Cookie: `WILDAUTHNEW_V3=${addToBasketDto.token};`,
          },
        },
      ),
    );
  }

  async selectPickpoint(selectPickpointDto: SelectPickpointDto) {
    const bodyFormData = new FormData();

    bodyFormData.append(`Item.AddressId`, selectPickpointDto.addressId);

    await firstValueFrom(
      this.httpService.post(
        `https://www.wildberries.ru/spa/poos/create?version=1`,
        bodyFormData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${bodyFormData.getBoundary()}`,
            Cookie: `WILDAUTHNEW_V3=${selectPickpointDto.token};`,
          },
        },
      ),
    );

    this.addressId = selectPickpointDto.addressId;
  }

  async selectPayment(selectPaymentDto: SelectPaymentDto) {
    const bodyFormData = new FormData();

    bodyFormData.append(`paymentTypeId`, selectPaymentDto.paymentId);

    await firstValueFrom(
      this.httpService.post(
        `https://www.wildberries.ru/lk/basket/spa/refresh`,
        bodyFormData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${bodyFormData.getBoundary()}`,
            Cookie: `WILDAUTHNEW_V3=${selectPaymentDto.token};`,
          },
        },
      ),
    );

    this.paymentId = selectPaymentDto.paymentId;
  }

  async createOrder(token: string) {
    const bodyFormData = new FormData();

    bodyFormData.append(`orderDetails.DeliveryPointId`, this.addressId);

    bodyFormData.append('orderDetails.DeliveryWay', 'self');
    bodyFormData.append('orderDetails.PaymentType.Id', this.paymentId);

    bodyFormData.append(
      'orderDetails.UserBasketItems[0].CharacteristicId',
      this.characteristicId,
    );

    bodyFormData.append('orderDetails.TotalPrice', this.price);

    const res = await firstValueFrom(
      this.httpService.post(
        `https://www.wildberries.ru/lk/basket/spa/submitorder`,
        bodyFormData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${bodyFormData.getBoundary()}`,
            Cookie: `WILDAUTHNEW_V3=${token};`,
          },
        },
      ),
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'url',
      data: {
        url: res.data.value.url,
      },
    };
  }
}
