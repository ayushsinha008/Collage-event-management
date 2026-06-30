import { CONSTANTS } from '../constants';

export class APIFeatures {
  query: any;
  queryString: any;

  constructor(query: any, queryString: any) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Advanced filtering for gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(searchFields: string[]) {
    if (this.queryString.search && searchFields.length > 0) {
      const regex = new RegExp(this.queryString.search as string, 'i');
      const searchConditions = searchFields.map((field) => ({ [field]: regex }));
      this.query = this.query.find({ $or: searchConditions });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = (this.queryString.sort as string).split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page as string, 10) || CONSTANTS.PAGINATION.DEFAULT_PAGE;
    const limit = parseInt(this.queryString.limit as string, 10) || CONSTANTS.PAGINATION.DEFAULT_LIMIT;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
