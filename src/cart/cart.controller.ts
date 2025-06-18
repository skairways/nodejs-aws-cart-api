import {
  Controller,
  Get,
  Delete,
  Put,
  Body,
  Req,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { Order, OrderService } from '../order';
import { AppRequest, getUserIdFromRequest } from '../shared';
import { calculateCartTotal } from './models-rules';
import { CartService } from './services';
import { CartItem } from './cart-item.entity';
import { CreateOrderDto, PutCartPayloadDto } from 'src/order/type';
import { ApiTags } from '@nestjs/swagger';
import { Cart } from './cart.entity';

@ApiTags('Cart')
@Controller('api/profile/cart')
export class CartController {
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
  ) {}

  @Get()
  async findUserCart(@Req() req: AppRequest): Promise<Cart> {
    const cart = await this.cartService.findOrCreateByUserId(
      getUserIdFromRequest(req),
    );

    return cart;
  }

  @Put()
  async updateUserCart(
    @Req() req: AppRequest,
    @Body() body: PutCartPayloadDto,
  ): Promise<CartItem[]> {
    // TODO: validate body payload...
    const cart = await this.cartService.updateByUserId(
      getUserIdFromRequest(req),
      body,
    );

    return cart.items;
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async clearUserCart(@Req() req: AppRequest) {
    await this.cartService.removeByUserId(getUserIdFromRequest(req));
  }

  @Put('order')
  async checkout(@Req() req: AppRequest, @Body() body: CreateOrderDto) {
    const userId = getUserIdFromRequest(req);
    const cart = await this.cartService.findByUserId(userId);

    if (!(cart && cart.items.length)) {
      throw new BadRequestException('Cart is empty');
    }
    //TODO: finish checkout logic
    /*    const { id: cartId, items } = cart;
    const total = calculateCartTotal(items);
    const order = this.orderService.create({
      userId,
      cartId,
      items: items.map(({ product, count }) => ({
        productId: product.id,
        count,
      })),
      address: body.address,
      total,
    });
    await this.cartService.removeByUserId(userId);

    return {
      order,
    }; */
  }

  @Get('order')
  getOrder(): Order[] {
    return this.orderService.getAll();
  }
}
