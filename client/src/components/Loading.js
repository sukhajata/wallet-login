import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

const Loading = () => {
  return (
    <Grid container direction="column" align="center" justify="center">
      <Typography variant="h5">Please complete the signature request using your wallet.</Typography>
    </Grid>
  );
};

export default Loading;
