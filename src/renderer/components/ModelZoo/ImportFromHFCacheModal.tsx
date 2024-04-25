import useSWR from 'swr';
import * as chatAPI from 'renderer/lib/transformerlab-api-sdk';

import { 
    Button, 
    Checkbox,
    CircularProgress,
    FormControl,
    FormLabel,
    Modal, 
    ModalClose, 
    ModalDialog, 
    Stack,
    Table,
    Typography
} from '@mui/joy';

import {
    ArrowRightFromLineIcon
} from 'lucide-react';

// fetcher used by SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ImportFromHFCacheModal({ open, setOpen}) {
    const {
        data: modelsData,
        error: modelsError,
        isLoading: isLoading,
    } = useSWR(
        chatAPI.Endpoints.Models.GetHFCacheModelList(),
        fetcher
    );

    const models = modelsData?.data;

    // model_ids is an iterator
    async function importRun(model_ids: Iterator) {
        let next = model_ids.next();
        while(!next.done) {
            console.log("Importing " + next.value);
            next = model_ids.next();
        }
        await fetch(
          chatAPI.Endpoints.Models.ImportHFCacheModels(next.value)
        );
        return;
    }

    return (
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h2">Select models to import:</Typography>
          <form
            id="import-hfcache-form"
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                justifyContent: 'space-between',
            }}
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                const form_data = new FormData(event.currentTarget);
                const model_ids = (form_data as any).entries();

                // model_ids is an interator with a list of model IDs to import
                importRun(model_ids);
                setOpen(false);
            }}
          >

            <Table
                aria-labelledby="tableTitle"
                stickyHeader
                hoverRow
                sx={{
                    '--TableCell-headBackground': (theme) =>
                    theme.vars.palette.background.level1,
                    '--Table-headerUnderlineThickness': '1px',
                    '--TableRow-hoverBackground': (theme) =>
                    theme.vars.palette.background.level1,
                    height: '100px',
                    overflow: 'auto',
                }}
              >
              <thead>
                <tr>
                  <th style={{ width: 25, padding: 12 }}> </th>
                  <th style={{ width: 175, padding: 12 }}>Model ID</th>
                  <th style={{ width: 120, padding: 12 }}>Architecture</th>
                  <th style={{ width: 80, padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && models?.length > 0 && models.map((row) => (
                <tr key={row.rowid}>
                  <td>
                  <Typography ml={2} fontWeight="lg">
                    {row.installed
                        ? " "
                        : (row.supported 
                            ? <Checkbox name={row.id} defaultChecked />
                            : <Checkbox disabled />
                          )
                    }
                    </Typography>
                  </td>
                  <td>
                    <Typography ml={2} fontWeight={row.supported ? "lg" : "sm"}>
                        {row.id}
                    </Typography>
                  </td>
                  <td>
                    <Typography ml={2} fontWeight={row.supported ? "lg" : "sm"}>
                        {row.architecture}
                    </Typography>
                  </td>
                  <td>
                    <Typography ml={2} fontWeight={row.supported ? "lg" : "sm"}>
                        {row.status}
                    </Typography>
                  </td>
                </tr>
              ))}
              {!isLoading && models?.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <Typography
                        level="body-lg"
                        justifyContent="center"
                        margin={5}
                    >
                      No new models found.
                  </Typography>
                  </td>
                </tr>
              )}
              {isLoading && (
                <tr>
                  <td colSpan={5}>
                    <CircularProgress color="primary" /> 
                    <Typography
                        level="body-lg"
                        justifyContent="center"
                        margin={5}
                    >
                      Scanning Hugging Face Cache...
                  </Typography>
                  </td>
                </tr>
              )}
              </tbody>
            </Table>

            <Stack spacing={2} direction="row" justifyContent="flex-end">
                <Button color="danger" variant="soft" onClick={() => setOpen(false)}>
                Cancel
                </Button>
                <Button
                    variant="soft"
                    type="submit"
                    disabled={models?.length==0}
                    startDecorator={<ArrowRightFromLineIcon />}>
                Import
                </Button>
            </Stack>

          </form>
        </ModalDialog>
      </Modal>
    )
}