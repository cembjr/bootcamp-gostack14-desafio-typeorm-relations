import { inject, injectable } from 'tsyringe';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('IOrdersRepository') private ordersRepository: IOrdersRepository,
    @inject('IProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('ICustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists) throw new AppError('cliente não existe', 400);

    const existentProducts = await this.productsRepository.findAllById(
      products,
    );

    if (!existentProducts.length) throw new AppError('não tem produto', 400);

    const existentProductsIds = existentProducts.map(prod => prod.id);

    const checkInexistentproducts = products.filter(
      prod => !existentProductsIds.includes(prod.id),
    );

    if (checkInexistentproducts.length)
      throw new AppError('tem produto que não existe');

    const findProductsWithNoQuantityAvaliable = products.filter(
      product =>
        existentProducts.filter(p => p.id === product.id)[0].quantity <
        product.quantity,
    );

    if (findProductsWithNoQuantityAvaliable.length)
      throw new AppError('tem produto sem estoque');

    const serializedProducts = products.map(prod => ({
      product_id: prod.id,
      quantity: prod.quantity,
      price: existentProducts.filter(p => p.id === prod.id)[0].price,
    }));

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,
    });

    const { order_products } = order;

    const orderedProductsQuantity = order_products.map(prod => ({
      id: prod.product_id,
      quantity:
        existentProducts.filter(p => p.id === prod.product_id)[0].quantity -
        prod.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);

    console.log('order id', order);

    return order;
  }
}

export default CreateOrderService;
