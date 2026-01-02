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


    const systemFields = [
      'page',
      'limit',
      'sort',
      'sortBy',
      'sortOrder',
      'fields',
      'include',
      'searchTerm',
      'startDate',
      'endDate'
    ];
    const allExcludeFields = [...excludeFields, ...systemFields];


    allExcludeFields.forEach(field => delete filter[field]);

    Object.keys(filter).forEach(key => {
      if (filter[key] === undefined || filter[key] === null || filter[key] === '') {
        delete filter[key];
      }
    });


    Object.keys(filter).forEach(key => {
      if (filter[key] === 'true') filter[key] = true;
      if (filter[key] === 'false') filter[key] = false;
    });

    this.where = { ...this.where, ...filter };
    return this;
  }


  search(searchableFields: string[]): this {
    const term = this.query.searchTerm;
    
    if (!term || !searchableFields || searchableFields.length === 0) return this;

    const searchCondition = {
      OR: searchableFields.map((field) => ({
        [field]: {
          contains: String(term),
          mode: "insensitive",
        },
      }))
    };


    if (Object.keys(this.where).length > 0) {
      const existingConditions = { ...this.where };
      this.where = {
        AND: [
          existingConditions,
          searchCondition
        ]
      };
    } else {
      this.where = searchCondition;
    }

    return this;
  }

  dateRange(startDateField: string = 'createdAt', endDateField?: string): this {
    const startDate = this.query.startDate;
    const endDate = this.query.endDate;

    if (startDate) {
      try {
        this.where[startDateField] = {
          ...this.where[startDateField],
          gte: new Date(startDate)
        };
      } catch (error) {
        console.error('Invalid start date format:', startDate);
      }
    }

    if (endDate) {
      const targetField = endDateField || startDateField;
      try {
        this.where[targetField] = {
          ...this.where[targetField],
          lte: new Date(endDate)
        };
      } catch (error) {
        console.error('Invalid end date format:', endDate);
      }
    }

    return this;
  }


sort(defaultSort?: string): this {
  let sortString = this.query.sort;

  if (sortString === "asc" || sortString === "desc") {
    sortString = undefined;
  }

  if (!sortString && this.query.sortBy) {
    const order = this.query.sortOrder === "desc" ? "-" : "";
    sortString = `${order}${this.query.sortBy}`;
  }

  if (!sortString && defaultSort) {
    sortString = defaultSort;
  }

  if (!sortString) return this;

  const fields = sortString.split(",").filter(Boolean);

  this.orderBy = fields.map((item: string) => {
    const order = item.startsWith("-") ? "desc" : "asc";
    const field = item.replace(/^-/, "").trim();

    if (!field || field === "asc" || field === "desc") {
      throw new Error(`Invalid sort field: "${field}"`);
    }

    return { [field]: order };
  });

  return this;
}


  fields(): this {
    if (!this.query.fields) return this;

    const fieldList = typeof this.query.fields === 'string' 
      ? this.query.fields.split(",")
      : Array.isArray(this.query.fields) 
      ? this.query.fields 
      : [];

    this.select = fieldList
      .filter(Boolean)
      .reduce((acc: any, field: string) => {
        const trimmedField = field.trim();
        if (trimmedField) {
          acc[trimmedField] = true;
        }
        return acc;
      }, {});

    return this;
  }


  relation(defaultIncludes?: Record<string, any>): this {
    if (!this.query.include && !defaultIncludes) return this;

    this.include = defaultIncludes ? { ...defaultIncludes } : {};

    if (this.query.include) {
      const includeList = typeof this.query.include === 'string'
        ? this.query.include.split(",")
        : Array.isArray(this.query.include)
        ? this.query.include
        : [];

      includeList
        .filter(Boolean)
        .forEach((relation: string) => {
          const trimmedRelation = relation.trim();
          if (trimmedRelation) {
            this.include[trimmedRelation] = true;
          }
        });
    }

    return this;
  }


  paginate(): this {
    const page = Math.max(1, Number(this.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.query.limit) || 10));

    this.take = limit;
    this.skip = (page - 1) * limit;

    return this;
  }


  addWhere(condition: Record<string, any>): this {
    if (Object.keys(this.where).length > 0) {
      this.where = {
        AND: [
          this.where,
          condition
        ]
      };
    } else {
      this.where = condition;
    }
    return this;
  }

  reset(part: 'where' | 'orderBy' | 'select' | 'include' | 'pagination' | 'all' = 'all'): this {
    switch (part) {
      case 'where':
        this.where = {};
        break;
      case 'orderBy':
        this.orderBy = [];
        break;
      case 'select':
        this.select = undefined;
        break;
      case 'include':
        this.include = undefined;
        break;
      case 'pagination':
        this.take = undefined;
        this.skip = undefined;
        break;
      case 'all':
        this.where = {};
        this.orderBy = [];
        this.select = undefined;
        this.include = undefined;
        this.take = undefined;
        this.skip = undefined;
        break;
    }
    return this;
  }


  async build() {
    if (this.model === null) {
      throw new Error('Model is null. Cannot execute query.');
    }

    const options: any = {};

    if (Object.keys(this.where).length > 0) {
      options.where = this.where;
    }

    if (this.orderBy.length > 0) options.orderBy = this.orderBy;
    if (this.select && Object.keys(this.select).length > 0) {
      options.select = this.select;
    }
    if (this.include && Object.keys(this.include).length > 0) {
      options.include = this.include;
    }
    if (this.take !== undefined) options.take = this.take;
    if (this.skip !== undefined) options.skip = this.skip;

    return await this.model.findMany(options);
  }


  async first() {
    if (this.model === null) {
      throw new Error('Model is null. Cannot execute query.');
    }

    const options: any = {};

    if (Object.keys(this.where).length > 0) {
      options.where = this.where;
    }

    if (this.orderBy.length > 0) options.orderBy = this.orderBy;
    if (this.select && Object.keys(this.select).length > 0) {
      options.select = this.select;
    }
    if (this.include && Object.keys(this.include).length > 0) {
      options.include = this.include;
    }

    return await this.model.findFirst(options);
  }


  async count() {
    if (this.model === null) {
      throw new Error('Model is null. Cannot execute query.');
    }

    const options: any = {};
    
    if (Object.keys(this.where).length > 0) {
      options.where = this.where;
    }

    return await this.model.count(options);
  }

  async getMeta() {
    const total = await this.count();
    const page = Math.max(1, Number(this.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(this.query.limit) || 10));
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
      hasNextPage: page < totalPage,
      hasPrevPage: page > 1,
    };
  }

 
  getWhere() {
    return this.where;
  }


  getQueryOptions() {
    return {
      where: this.where,
      orderBy: this.orderBy,
      select: this.select,
      include: this.include,
      take: this.take,
      skip: this.skip,
    };
  }
}