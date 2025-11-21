import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateProductDto } from './entities/dto/create-product.dto';
import { UpdateProductDto } from './entities/dto/update-product.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getServiceInfo();
  }

  @Get('health')
  healthCheck() {
    return this.appService.healthCheck();
  }

  @Get('products')
  @UseGuards(AuthGuard)
  findAllProducts() {
    return this.appService.findAll();
  } 

  @Get('products/:id')
  @UseGuards(AuthGuard)
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.appService.findOne(id);
  }

  @Post('products')
  @UseGuards(AuthGuard)
  createProduct(@Body() createProductDto: CreateProductDto) {
    return this.appService.create(createProductDto);
  }

  @Put('products/:id')
  @UseGuards(AuthGuard)
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.appService.update(id, updateProductDto);
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  removeProduct(@Param('id', ParseIntPipe) id: number) {
    return this.appService.remove(id);
  }
}
