import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Product from '../infra/typeorm/entities/Product';
import IProductsRepository from '../repositories/IProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
}

@injectable()
class CreateProductService {
  constructor(
    @inject('IProductsRepository')
    private productsRepository: IProductsRepository,
  ) {}

  public async execute({ name, price, quantity }: IRequest): Promise<Product> {
    try {
      const productExists = await this.productsRepository.findByName(name);

      if (productExists) throw new AppError('Product already exists', 400);

      const product = await this.productsRepository.create({
        name,
        price,
        quantity,
      });
      return product;
    } catch (ex) {
      throw new AppError('Ocorreu um erro ao cadastrar');
    }
  }
}

export default CreateProductService;
