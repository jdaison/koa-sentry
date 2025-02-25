import * as grpc from "@grpc/grpc-js";
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';

const PROTO_PATH = path.resolve(__dirname, 'product.proto');
const loadProto = () => {
  try {

    const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
    });

    if (!packageDefinition) {
      throw new Error('Failed to load proto file');
    }

    const proto = grpc.loadPackageDefinition(packageDefinition) as any;
    const client = new proto.product.ProductService(
      'localhost:50051',
      grpc.credentials.createInsecure()
    );
    return client;
  } catch (error) {
    console.log('Error loading proto file:', error);
  }
}

export const findProducts = () => {
  const client = loadProto();
  const metadata = new grpc.Metadata();
  metadata.add('userId', 'user-123'); // You can replace 'user-123' with actual user id

  try {
    return new Promise((resolve, reject) => {
      client.findProducts({}, metadata, (error: any, response: any) => {
      if (error) {
        console.error('Error finding products:', error);
        reject(error);
        return;
      }
      resolve(response);
      });
    });

  } catch (error) {
    console.error('Error loading proto file:', error);
    console.error('Attempted to load from path:', PROTO_PATH);
    throw error;
  }
};