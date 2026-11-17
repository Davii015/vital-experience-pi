// The authenticated identity comes from the database, never from a request body.
const isProfessional = (actor) => actor?.role === 'PROFESSIONAL';
const isPatient = (actor) => actor?.role === 'PATIENT';
const userScope = (actor) => isPatient(actor) ? { id: actor.userId }
  : isProfessional(actor) ? { professionalId: actor.professionalId } : {};
// A patient without a responsible professional must never fall back to global access.
const professionalScope = (actor) => isPatient(actor) ? { id: actor.professionalId ?? -1 }
  : isProfessional(actor) ? { id: actor.professionalId } : {};
const sessionScope = (actor) => isProfessional(actor)
  ? { professionalId: actor.professionalId, user: { professionalId: actor.professionalId } }
  : isPatient(actor) ? { userId: actor.userId } : {};
const sensorScope = (actor) => isPatient(actor) ? { userId: actor.userId }
  : isProfessional(actor) ? { user: userScope(actor) } : {};
const readingScope = (actor) => isProfessional(actor) || isPatient(actor) ? { session: sessionScope(actor) } : {};
const reportScope = sessionScope;

module.exports = { isProfessional, isPatient, userScope, professionalScope, sessionScope, sensorScope, readingScope, reportScope };
