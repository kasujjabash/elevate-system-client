import React, { useEffect, useState } from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { reqArray, reqObject, reqString } from '../../../data/validations';
import XForm from '../../../components/forms/XForm';
import XTextInput from '../../../components/inputs/XTextInput';
import XCheckBoxInput from '../../../components/inputs/XCheckBoxInput';
import { remoteRoutes } from '../../../data/constants';
import { XRemoteSelect } from '../../../components/inputs/XRemoteSelect';
import { comboParser } from '../../../components/inputs/inputHelpers';
import { handleSubmission, ISubmission } from '../../../utils/formHelpers';
import { del, get } from '../../../utils/ajax';
import Toast from '../../../utils/Toast';
import XComboInput from '../../../components/inputs/XComboInput';
import { cleanComboValue } from '../../../utils/dataHelpers';
import { IRoles } from './types';

interface IProps {
  data: any;
  isNew: boolean;
  done: (dt: any) => any;
  onDeleted: (dt: any) => any;
  onCancel?: () => any;
}

const schema = yup.object().shape({
  contact: reqObject,
  username: reqString,
  password: reqString.min(8),
  roles: reqArray,
});

const editSchema = yup.object().shape({
  password: yup
    .string()
    .nullable()
    .optional()
    .test(
      'min-if-set',
      'Password must be at least 8 characters',
      (val) => !val || val.length >= 8,
    ),
  roles: reqArray,
});

const initialValues = {
  contact: null,
  username: '',
  password: '',
  roles: [],
  isActive: true,
};

const UserEditor = ({ data, isNew, done, onDeleted, onCancel }: IProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    get(remoteRoutes.roles, (resp: IRoles[]) => {
      const active = Array.isArray(resp)
        ? resp.filter((it) => it.isActive).map((it) => it.role)
        : [];
      setUserRoles(active);
    });
  }, []);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: any = {
      contactId: Number(values.contact?.id),
      username: values.username,
      password: values.password || undefined,
      roles: cleanComboValue(values.roles),
      isActive: values.isActive,
    };
    if (!isNew) toSave.id = data.id;

    const submission: ISubmission = {
      url: remoteRoutes.users,
      values: toSave,
      actions,
      isNew,
      onAjaxComplete: done,
    };
    handleSubmission(submission);
  }

  function handleDelete() {
    setLoading(true);
    del(
      `${remoteRoutes.users}/${data.id}`,
      () => {
        Toast.success('Operation succeeded');
        onDeleted(data);
      },
      undefined,
      () => setLoading(false),
    );
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={isNew ? schema : editSchema}
      initialValues={data || initialValues}
      onDelete={isNew ? undefined : handleDelete}
      loading={loading}
      onCancel={onCancel}
    >
      <Grid spacing={1} container>
        {isNew && (
          <>
            <Grid item xs={12}>
              <XRemoteSelect
                name="contact"
                label="Person"
                filter={{ skipUsers: true }}
                remote={remoteRoutes.contactsPeopleCombo}
                parser={comboParser}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <XTextInput
                name="username"
                label="Username (email)"
                type="email"
                variant="outlined"
                autoComplete="off"
              />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <XComboInput
            name="roles"
            label="Roles"
            options={userRoles}
            variant="outlined"
            multiple
          />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="password"
            label={
              isNew ? 'Password' : 'New Password (leave blank to keep current)'
            }
            type="password"
            variant="outlined"
            autoComplete="new-password"
          />
        </Grid>
        <Grid item xs={12}>
          <XCheckBoxInput name="isActive" label="Activate this user account" />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default UserEditor;
