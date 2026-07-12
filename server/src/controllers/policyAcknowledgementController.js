import * as ackService from '../services/policyAcknowledgementService.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

export const acknowledgePolicy = asyncHandler(async (req, res) => {
  const acknowledgement = await ackService.acknowledgePolicy(
    req.user.organizationId,
    req.user.sub,
    req.params.policyId
  );
  sendSuccess(res, 'Policy acknowledged', acknowledgement, 201);
});

export const listAcknowledgements = asyncHandler(async (req, res) => {
  const acknowledgements = await ackService.listAcknowledgements(
    req.user.organizationId,
    req.params.policyId
  );
  sendSuccess(res, 'Policy acknowledgements', acknowledgements);
});

export const getMyAcknowledgement = asyncHandler(async (req, res) => {
  const status = await ackService.getMyAcknowledgement(
    req.user.organizationId,
    req.user.sub,
    req.params.policyId
  );
  sendSuccess(res, 'My acknowledgement status', status);
});
