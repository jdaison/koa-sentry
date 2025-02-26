import Sentry from './instrument';

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
    console.error('Error loading proto file:', error);
    throw error; // Rethrow the error so it's not silently swallowed
  }
}


export const findProducts = () => {
  return Sentry.startSpan(
    {
      name: "findProducts",
      op: "grpc.request",
      forceTransaction: true
    },
    () => {
      const client = loadProto();
      const metadata = new grpc.Metadata();
      
      const traceData = Sentry.getTraceData();
      
      if (traceData['sentry-trace']) {
        metadata.add('sentry-trace', traceData['sentry-trace']);
      }
      if (traceData['baggage']) {
        metadata.add('baggage', traceData['baggage']);
      }
      
      metadata.add('userId', 'user-john-1');

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
        console.error('Error:', error);
        throw error;
      }
    }
  );
};