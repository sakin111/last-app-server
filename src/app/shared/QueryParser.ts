
import { ParsedQs } from 'qs';

export class QueryParser {

  static toStringRecord(query: ParsedQs): Record<string, string> {
    const result: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      
      if (typeof value === 'string') {
        result[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        const firstValue = value[0];
        if (typeof firstValue === 'string') {
          result[key] = firstValue;
        }else if (typeof value === 'object') {

     result[key] = JSON.stringify(value);
     }
      }
    }
    
    return result;
  }
}