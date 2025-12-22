import { PrismaClient } from "@prisma/client";

export class QueryBuilder<M extends keyof PrismaClient> {
  private model: any;
  private query: Record<string, any>;

  private where: Record<string, any> = {};
  private orderBy: any[] = [];
  private select: any = undefined;
  private include: any = undefined;
  private take: number | undefined;
  private skip: number | undefined;

  constructor(model: PrismaClient[M], query: Record<string, any>) {
    this.model = model;
    this.query = query;
  }

  /**
   * Filter query parameters, excluding special fields
   * @param excludeFields - Fields to exclude from filtering
   */
  filter(excludeFields: string[] = []): this {
    const filter = { ...this.query };
    
    // Remove excluded fields
    excludeFields.forEach(field => delete filter[field]);
    
    // Remove empty/null/undefined values
    Object.keys(filter).forEach(key => {
      if (filter[key] === undefined || filter[key] === null || filter[key] === '') {
        delete filter[key];
      }
    });

    this.where = { ...this.where, ...filter };
    return this;
  }

  /**
   * Add search functionality across multiple fields
   * @param searchableFields - Fields to search in
   */
  search(searchableFields: string[]): this {
    const term = this.query.searchTerm;
    if (!term || searchableFields.length === 0) return this;

    this.where.OR = searchableFields.map((field) => ({
      [field]: { contains: term, mode: "insensitive" },
    }));

    return this;
  }

  /**
   * Add sorting
   * Format: "field1,-field2" (- prefix for descending)
   */
  sort(): this {
    if (!this.query.sort) return this;
    
    const fields = this.query.sort.split(",").filter(Boolean);

    this.orderBy = fields.map((item: string) => {
      const order = item.startsWith("-") ? "desc" : "asc";
      const field = item.replace(/^-/, "");
      return { [field]: order };
    });

    return this;
  }

  /**
   * Select specific fields
   * Format: "field1,field2,field3"
   */
  fields(): this {
    if (!this.query.fields) return this;

    this.select = this.query.fields
      .split(",")
      .filter(Boolean)
      .reduce((acc: any, field: string) => {
        acc[field.trim()] = true;
        return acc;
      }, {});
    
    return this;
  }

  /**
   * Include relations
   * Format: "relation1,relation2"
   */
  relation(): this {
    if (!this.query.include) return this;

    this.include = this.query.include
      .split(",")
      .filter(Boolean)
      .reduce((acc: any, relation: string) => {
        acc[relation.trim()] = true;
        return acc;
      }, {});
    
    return this;
  }

  /**
   * Add pagination
   */
  paginate(): this {
    const page = Math.max(1, Number(this.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.query.limit) || 10));

    this.take = limit;
    this.skip = (page - 1) * limit;
    return this;
  }

  /**
   * Build and execute the query
   */
  async build() {
    const options: any = {
      where: this.where,
    };

    if (this.orderBy.length) options.orderBy = this.orderBy;
    if (this.select) options.select = this.select;
    if (this.include) options.include = this.include;
    if (this.take !== undefined) options.take = this.take;
    if (this.skip !== undefined) options.skip = this.skip;

    return await this.model.findMany(options);
  }


  async getMeta() {
    const total = await this.model.count({ where: this.where });

    const page = Math.max(1, Number(this.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.query.limit) || 10));
    const totalPage = Math.ceil(total / limit);

    return { 
      page, 
      limit, 
      total, 
      totalPage,
      hasNextPage: page < totalPage,
      hasPrevPage: page > 1
    };
  }
}

