import React, { useState } from 'react';
import { Form, Formik, FormikHelpers } from 'formik';

import { Grid } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { hasValue } from '../inputs/inputHelpers';

const CORAL = '#E72C6C';

interface IProps {
  schema?: any;
  onSubmit: (values: any, actions: FormikHelpers<any>) => any;
  onCancel?: () => any;
  onDelete?: () => any;
  debug?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
  initialValues?: any;
  submitButtonAlignment?: 'left' | 'right';
}

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 350,
    [theme.breakpoints.down('sm')]: {
      minWidth: '100%',
    },
  },
}));

const XForm = (props: IProps) => {
  const [count, setCount] = useState<number>(0);
  const classes = useStyles();

  function handleDelete() {
    if (count === 1) {
      setCount(0);
      if (props.onDelete) {
        props.onDelete();
      }
    } else {
      setCount(count + 1);
    }
  }

  const buttonAlignment =
    props.submitButtonAlignment === 'left' ? 'flex-start' : 'flex-end';

  return (
    <Formik
      initialValues={props.initialValues || {}}
      onSubmit={props.onSubmit}
      validationSchema={props.schema}
      validateOnBlur
      enableReinitialize
    >
      {({ submitForm, isSubmitting, values, errors, touched, submitCount }) => (
        <Form autoComplete="food">
          <Grid container spacing={0} className={classes.root}>
            {submitCount > 0 && hasValue(errors) && (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" pb={2}>
                  <div
                    style={{
                      background: 'rgba(231,44,108,0.07)',
                      border: '1px solid rgba(231,44,108,0.25)',
                      borderRadius: 8,
                      padding: '10px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: CORAL,
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    Please provide all required fields.
                  </div>
                </Box>
              </Grid>
            )}
            <Grid item xs={12}>
              <Box>{props.children}</Box>
            </Grid>
            <Grid item xs={12}>
              <Box p={1} pt={2}>
                <Grid
                  container
                  spacing={1}
                  alignContent="flex-end"
                  justifyContent={buttonAlignment}
                >
                  {props.onDelete && (
                    <Grid item>
                      <Button
                        variant="outlined"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        style={{
                          borderColor: count === 1 ? '#ef4444' : '#e0e0e0',
                          color: count === 1 ? '#ef4444' : '#6b7280',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 8,
                        }}
                      >
                        {count === 1 ? 'Confirm Delete' : 'Delete'}
                      </Button>
                    </Grid>
                  )}
                  {props.onCancel && (
                    <Grid item>
                      <Button
                        variant="outlined"
                        onClick={props.onCancel}
                        disabled={isSubmitting || props.loading}
                        style={{
                          borderColor: '#e0e0e0',
                          color: '#6b7280',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: 8,
                        }}
                      >
                        Cancel
                      </Button>
                    </Grid>
                  )}
                  <Grid item>
                    <Button
                      variant="contained"
                      onClick={submitForm}
                      disabled={isSubmitting || props.loading}
                      style={{
                        background:
                          isSubmitting || props.loading ? '#f3f4f6' : CORAL,
                        color:
                          isSubmitting || props.loading ? '#9ca3af' : '#fff',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: 8,
                        boxShadow: 'none',
                      }}
                    >
                      {isSubmitting || props.loading ? 'Saving…' : 'Save'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            {props.debug && (
              <Grid item xs={12}>
                <pre style={{ width: '100%', height: '100%' }}>
                  {JSON.stringify({ values, errors, touched }, null, 2)}
                </pre>
              </Grid>
            )}
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default XForm;
