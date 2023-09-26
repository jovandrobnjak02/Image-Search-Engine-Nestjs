import { HttpStatus, Injectable } from '@nestjs/common';
import { writeFileSync } from 'fs';
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
    const schemaConfig = {
      class: 'Image',
      vectorizer: 'img2vec-neural',
      vectorIndexType: 'hnsw',
      moduleConfig: {
        'img2vec-neural': {
          imageFields: ['image'],
        },
      },
      properties: [
        {
          name: 'image',
          dataType: ['blob'],
        },
        {
          name: 'text',
          dataType: ['string'],
        },
      ],
    };

    await this.client.schema.classCreator().withClass(schemaConfig).do();
    await this.client.data
      .creator()
      .withClassName('Image')
      .withProperties({
        image: b64,
        text: fileName,
      })
      .do();
    return { statu: HttpStatus.CREATED, message: 'Added New Image' };
  }

  async getNearImage(image: string) {
    const resImage = await this.client.graphql
      .get()
      .withClassName('Image')
      .withFields('image')
      .withNearImage({ image, certainty: 0.8 })
      .withLimit(1)
      .do();

    const img = await resImage.data.Get.Image[0].image;
    writeFileSync('./result.jpg', img, 'base64');

    return img;
  }
}
