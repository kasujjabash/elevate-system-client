import React, { useState } from 'react';
import * as yup from 'yup';
import { FormikHelpers } from 'formik';
import Grid from '@material-ui/core/Grid';
import { Box } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import { reqEmail, reqString } from '../../data/validations';
import {
  ageCategories,
  civilStatusCategories,
  genderCategories,
  responseCategories,
} from '../../data/comboCategories';
import XForm from '../../components/forms/XForm';
import XTextInput from '../../components/inputs/XTextInput';
import XSelectInput from '../../components/inputs/XSelectInput';
import { hasValue, toOptions } from '../../components/inputs/inputHelpers';
import { remoteRoutes } from '../../data/constants';
import { post } from '../../utils/ajax';
import Toast from '../../utils/Toast';
import XRadioInput from '../../components/inputs/XRadioInput';
import { getDayList, getMonthsList } from '../../utils/dateHelpers';

interface IProps {
  data: any | null;
  done?: () => any;
}

const schema = yup.object().shape({
  hubName: reqString,
  firstName: reqString,
  otherNames: reqString,
  gender: reqString,
  birthDay: reqString,
  birthMonth: reqString,
  civilStatus: reqString,
  ageGroup: reqString,
  email: reqEmail,
  phone: reqString,
  interestedInCourses: reqString,
});

const initialValues = {
  hubName: '',
  firstName: '',
  otherNames: '',
  birthDay: '',
  birthMonth: '',
  gender: '',
  civilStatus: '',
  ageGroup: '',
  occupation: '',
  residence: '',
  email: '',
  phone: '',
  interestedInCourses: '',
  hasLaptop: '',
};

const processName = (name: string): string[] => {
  const [lastName, ...rest] = name.split(' ');
  if (hasValue(rest)) {
    return [lastName, rest.join(' ')];
  }
  return [lastName];
};

const RegisterForm = ({ done }: IProps) => {
  const [wantsMultipleCourses, setWantsMultipleCourses] = useState(false);

  function handleSubmit(values: any, actions: FormikHelpers<any>) {
    const [lastName, middleName] = processName(values.otherNames);

    const toSave: any = {
      hubName: values.hubName,
      firstName: values.firstName,
      middleName,
      lastName,
      dateOfBirth: `1800-${values.birthMonth}-${values.birthDay}T00:00:00.000Z`,
      gender: values.gender,
      civilStatus: values.civilStatus,
      ageGroup: values.ageGroup,
      occupation: values.occupation,
      residence: values.residence,
      email: values.email,
      phone: values.phone,
      interestedInCourses: values.interestedInCourses,
      hasLaptop: values.hasLaptop,
    };

    post(
      remoteRoutes.register,
      toSave,
      () => {
        Toast.info(
          'Registration successful! Welcome to Elevate Academy. Please check your email for login instructions.',
        );
        actions.resetForm();
        if (done) done();
      },
      undefined,
      () => {
        actions.setSubmitting(false);
      },
    );
  }

  const changeCourseInterest = (value: any) => {
    setWantsMultipleCourses(value === 'Multiple');
  };

  return (
    <XForm
      onSubmit={handleSubmit}
      schema={schema}
      initialValues={initialValues}
    >
      <div style={{ padding: 8 }}>
        <Grid spacing={2} container className="min-width-100">
          {/* ── Student Information ── */}
          <Grid item xs={12}>
            <Box pt={2}>
              <Typography variant="caption">Student Information</Typography>
            </Box>
            <Divider />
          </Grid>

          <Grid item xs={12}>
            <XSelectInput
              name="hubName"
              label="Select Hub Location"
              options={[
                { id: 'katanga', name: 'Katanga Hub' },
                { id: 'kosovo', name: 'Kosovo Hub' },
                { id: 'jinja', name: 'Jinja Hub' },
                { id: 'namayemba', name: 'Namayemba Hub' },
                { id: 'lyantode', name: 'Lyantode Hub' },
              ]}
              variant="outlined"
              margin="none"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <XTextInput
              name="firstName"
              label="First Name"
              type="text"
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <XTextInput
              name="otherNames"
              label="Other Names"
              type="text"
              variant="outlined"
              margin="none"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box pt={1} pl={1}>
              <XRadioInput
                name="gender"
                label="Gender"
                options={toOptions(genderCategories)}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <XSelectInput
              name="civilStatus"
              label="Civil Status"
              options={toOptions(civilStatusCategories)}
              variant="outlined"
              margin="none"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <XSelectInput
              name="ageGroup"
              label="Age Group"
              options={toOptions(ageCategories)}
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <XSelectInput
              name="birthMonth"
              label="Birth Month"
              options={toOptions(getMonthsList())}
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={6} md={4}>
            <XSelectInput
              name="birthDay"
              label="Birth Day"
              options={toOptions(getDayList())}
              variant="outlined"
              margin="none"
            />
          </Grid>

          {/* ── Contact & Course Information ── */}
          <Grid item xs={12}>
            <Box pt={2}>
              <Typography variant="caption">
                Contact &amp; Course Information
              </Typography>
            </Box>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <XTextInput
              name="phone"
              label="Phone Number"
              type="text"
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <XTextInput
              name="email"
              label="Email Address"
              type="email"
              variant="outlined"
              margin="none"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <XSelectInput
              name="interestedInCourses"
              label="Course Interest"
              options={[
                { id: 'web-development', name: 'Web Development' },
                { id: 'video-production', name: 'Video Production' },
                { id: 'film-photography', name: 'Film & Photography' },
                { id: 'ui-ux-design', name: 'UI/UX Design' },
                { id: 'multiple', name: 'Multiple Courses' },
              ]}
              variant="outlined"
              margin="none"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <XRadioInput
                name="hasLaptop"
                label="Do you have a laptop?"
                options={toOptions(responseCategories)}
                customOnChange={changeCourseInterest}
              />
            </Box>
          </Grid>

          {wantsMultipleCourses && (
            <Grid item xs={12}>
              <XTextInput
                name="additionalCourses"
                label="Please specify additional courses of interest"
                type="text"
                variant="outlined"
                margin="none"
                placeholder="e.g. Web Development, UI/UX Design"
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <XTextInput
              name="residence"
              label="Current Address"
              type="text"
              variant="outlined"
              margin="none"
              placeholder="e.g. Kampala, Uganda"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <XTextInput
              name="occupation"
              label="Current Occupation (Optional)"
              type="text"
              variant="outlined"
              margin="none"
              placeholder="Student, Working Professional, etc."
            />
          </Grid>
        </Grid>
      </div>
    </XForm>
  );
};

export default RegisterForm;
