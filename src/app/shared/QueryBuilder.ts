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

  filter(excludeFields: string[] = []): this {
    const filter = { ...this.query };
    for (const key of excludeFields) delete filter[key];

    this.where = { ...this.where, ...filter };
    return this;
  }

  search(searchableFields: string[]): this {
    const term = this.query.searchTerm;
    if (!term) return this;

    this.where.OR = searchableFields.map((field) => ({
      [field]: { contains: term, mode: "insensitive" },
    }));

    return this;
  }

  sort(): this {
    if (!this.query.sort) return this;
    const fields = this.query.sort.split(",");

    this.orderBy = fields.map((item: string) => {
      const order = item.startsWith("-") ? "desc" : "asc";
      const field = item.replace("-", "");
      return { [field]: order };
    });

    return this;
  }

  fields(): this {
    if (!this.query.fields) return this;

    this.select = this.query.fields.split(",").reduce((acc: any, f: string) => {
      acc[f] = true;
      return acc;
    }, {});
    return this;
  }

  relation(): this {
    if (!this.query.include) return this;

    this.include = this.query.include.split(",").reduce((acc: any, f: string) => {
      acc[f] = true;
      return acc;
    }, {});
    return this;
  }

  paginate(): this {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;

    this.take = limit;
    this.skip = (page - 1) * limit;
    return this;
  }

  async build() {
    return this.model.findMany({
      where: this.where,
      orderBy: this.orderBy.length ? this.orderBy : undefined,
      select: this.select,
      include: this.include,
      take: this.take,
      skip: this.skip,
    });
  }

  async getMeta() {
    const total = await this.model.count({ where: this.where });

    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return { page, limit, total, totalPage };
  }
}
