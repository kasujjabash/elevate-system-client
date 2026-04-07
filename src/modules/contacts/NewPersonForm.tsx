import React from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { useDispatch } from 'react-redux';
import { reqEmail, reqString } from '../../data/validations';
import {
  civilStatusCategories,
  genderCategories,
} from '../../data/comboCategories';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import XSelectInput from '../../components/inputs/XSelectInput';
import { toOptions } from '../../components/inputs/inputHelpers';
import { remoteRoutes } from '../../data/constants';
import { crmConstants } from '../../data/contacts/reducer';
import { post } from '../../utils/ajax';
import Toast from '../../utils/Toast';
import XRadioInput from '../../components/inputs/XRadioInput';
import XDateInput from '../../components/inputs/XDateInput';
import { ICreatePersonDto } from './types';

const HUB_OPTIONS = ['Katanga', 'Kosovo', 'Jinja', 'Namayemba', 'Lyantode'];
const COURSE_OPTIONS = [
  'Graphic Design',
  'Website Development',
  'Film & Photography',
  'ALX Course',
];

interface IProps {
  data: any | null;
  done?: () => any;
}

const schema = yup.object().shape({
  firstName: reqString,
  lastName: reqString,
  gender: reqString,
  civilStatus: reqString,
  dateOfBirth: reqString,
  email: reqEmail,
  phone: reqString,
  hub: reqString,
  course: reqString,
});

const initialValues = {
  firstName: '',
  middleName: '',
  lastName: '',
  dateOfBirth: null,
  gender: '',
  civilStatus: '',
  placeOfWork: '',
  residence: '',
  hub: '',
  course: '',
  email: '',
  phone: '',
};

const NewPersonForm = ({ done }: IProps) => {
  const dispatch = useDispatch();

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const toSave: ICreatePersonDto = {
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth
        ? new Date(values.dateOfBirth).toISOString()
        : undefined,
      gender: values.gender,
      civilStatus: values.civilStatus,
      placeOfWork: values.placeOfWork,
      residence: values.residence,
      hub: values.hub,
      course: values.course,
      email: values.email,
      phone: values.phone,
    };

    post(
      remoteRoutes.contactsPeople,
      toSave,
      (data) => {
        Toast.info('Operation successful');
        actions.resetForm();
        dispatch({
          type: crmConstants.crmAddContact,
          payload: { ...data },
        });
        if (done) done();
      },
      undefined,
      () => {
        actions.setSubmitting(false);
      },
    );
  }

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={initialValues}
      onCancel={done}
    >
      <Grid spacing={2} container className="min-width-100">
        <Grid item xs={6}>
          <XTextInput
            name="firstName"
            label="First Name"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={6}>
          <XTextInput
            name="lastName"
            label="Last Name"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12}>
          <XTextInput
            name="middleName"
            label="Other Names"
            type="text"
            variant="outlined"
          />
        </Grid>
        <Grid item xs={6}>
          <XSelectInput
            name="civilStatus"
            label="Civil Status"
            options={toOptions(civilStatusCategories)}
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={6}>
          <XRadioInput
            name="gender"
            label=""
            options={toOptions(genderCategories)}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XDateInput
            name="dateOfBirth"
            label="Date of Birth"
            variant="outlined"
            margin="none"
            disableFuture
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XTextInput
            name="phone"
            label="Phone"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XTextInput
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XSelectInput
            name="hub"
            label="Hub Location *"
            options={toOptions(HUB_OPTIONS)}
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XSelectInput
            name="course"
            label="Course *"
            options={toOptions(COURSE_OPTIONS)}
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XTextInput
            name="placeOfWork"
            label="Place of work"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <XTextInput
            name="residence"
            label="Residence"
            type="text"
            variant="outlined"
            margin="none"
          />
        </Grid>
      </Grid>
    </XForm>
  );
};

export default NewPersonForm;
