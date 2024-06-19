import { ActionObj, ActionParams, TransformObj, TransformParams, TriggerObj, TriggerParams } from '@showbridge/types';

export type TriggerCopyObject = {
  type: 'Trigger';
  object: TriggerObj<TriggerParams> | TriggerObj<TriggerParams>[];
};

export type ActionCopyObject = {
  type: 'Action';
  object: ActionObj<ActionParams> | ActionObj<ActionParams>[];
};

export type TransformCopyObject = {
  type: 'Transform';
  object: TransformObj<TransformParams> | TransformObj<TransformParams>[];
};

export type CopyObject = TriggerCopyObject | TransformCopyObject | ActionCopyObject;
