import { HttpStatus, Injectable } from '@nestjs/common';
import weaviate, { WeaviateClient } from 'weaviate-ts-client';

@Injectable()
export class AppService {
  private readonly client: WeaviateClient;

  constructor() {
    this.client = weaviate.client({
      scheme: 'http',
      host: 'localhost:8080',
    });
  }

  async addImageToDatabase(b64: string, fileName: string) {
    await this.client.data
      .creator()
      .withClassName('Images')
      .withProperties({
        image: b64,
        text: fileName,
      })
      .do();

    return { status: HttpStatus.CREATED, message: 'Added new Image' };
  }

  async getNearImage(image: string) {
    const resImage = await this.client.graphql
      .get()
      .withClassName('Images')
      .withFields('image')
      .withNearImage({ image, certainty: 0.8 })
      .withLimit(1)
      .do();

    const img = await resImage.data.Get.Image;

    return img;
  }
}
