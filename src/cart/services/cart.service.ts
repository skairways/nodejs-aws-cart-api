import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { CartStatuses } from '../models';
import { PutCartPayload } from 'src/order/type';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from '../cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from '../cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) {}

  async findByUserId(userId: string): Promise<Cart> {
    if (!userId) return null;
    return await this.cartRepository.findOne({
      where: { user_id: userId },
      relations: ['items'],
    });
  }

  async createByUserId(user_id: string): Promise<Cart> {
    const timestamp = new Date();

    const userCart = {
      user_id: user_id ?? v4(),
      created_at: timestamp,
      updated_at: timestamp,
      status: CartStatuses.OPEN,
      items: [],
    };

    const newUserCart = await this.cartRepository.create(userCart);

    return await this.cartRepository.save(newUserCart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    console.log('🚀 ~ CartService ~ findOrCreateByUserId ~ userId:', userId);
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    const userCart = await this.findOrCreateByUserId(userId);
    const existingItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: userCart.id },
        product_id: payload.product.id,
      },
      relations: ['cart'],
    });

    if (existingItem) {
      existingItem.count += payload.count;
      await this.cartItemRepository.save(existingItem);
    } else {
      const newItem = this.cartItemRepository.create({
        product_id: payload.product.id,
        count: payload.count,
        cart: userCart,
      });
      await this.cartItemRepository.save(newItem);
    }

    userCart.updated_at = new Date();
    await this.cartRepository.save(userCart);

    return this.cartRepository.findOne({
      where: { id: userCart.id },
      relations: ['items'],
    });
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.cartRepository.delete({ user_id: userId });
  }
}
