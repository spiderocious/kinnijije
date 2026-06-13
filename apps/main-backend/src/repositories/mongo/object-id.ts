import { Types } from 'mongoose';

// A user-supplied id from a URL may not be a castable ObjectId (e.g.
// "not-an-objectid", "123"). Casting an invalid id inside a query throws a
// CastError that would bubble to the generic 500 handler. Guard at the repo
// boundary: an unparseable id can never match a document, so treat it as "not
// found" (the lookup returns null → the route returns a clean 404).
export function isValidObjectId(id: string): boolean {
  return Types.ObjectId.isValid(id);
}
