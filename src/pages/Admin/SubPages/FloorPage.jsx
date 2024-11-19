import { BreadcrumbResponsive } from "../../../components/reuseable/Breadcrumbs";
import DefaultLayout from "../../layout/DefaultLayout";

/* eslint-disable react/prop-types */
import {
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

import { useContext, useEffect, useState } from "react";

import { Input } from "../../../components/ui/input";

import { DataTablePagination } from "../../../components/reuseable/DataTablePagination";

import { useSchool } from "../../../components/context/SchoolContext";

import ReuseTable from "../../../components/reuseable/ReuseTable";
import { AuthContext } from "../../../components/context/AuthContext";
import { useParams } from "react-router-dom";
import SmallLoader from "../../../components/styles/SmallLoader";
import { useColumns } from "../../../components/reuseable/Columns";
import AddFloor from "../../../components/api/AddFloor";
import PageNotFound from "../../PageNotFound";

const FloorPage = () => {
  const { user } = useContext(AuthContext);

  const { buildingName } = useParams();

  const NavItems = [
    { to: "/", label: "Dashboard" },
    { to: "/structure-management/buildings", label: "Select Building" },
    // { to: `/structure-management/buildings/${buildingName}`, label: "Select Building BOSHET" },
    {
      label:
        user && user.campusName
          ? `Floors in ${buildingName} (${user.campusName})`
          : `Floors in ${buildingName}`,
    },
  ];

  const { error } = useSchool();

  return (
    <DefaultLayout>
      {error ? (
        <PageNotFound />
      ) : (
        <>
          <BreadcrumbResponsive
            pageName={
              user && user.campusName
                ? `Floors in ${buildingName} (${user.campusName})`
                : `Floors in ${buildingName}`
            }
            items={NavItems}
            ITEMS_TO_DISPLAY={3}
          />

          <BuildingTables />
        </>
      )}
    </DefaultLayout>
  );
};

const BuildingTables = () => {
  const { buildingName, campusId, floorName } = useParams();

  const { floors, fetchFloors, loadingBuildings, error } = useSchool();

  useEffect(() => {
    fetchFloors(buildingName, floorName, campusId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { columnFloors } = useColumns();

  return (
    <>
      <DataTable
        columns={columnFloors}
        data={floors}
        loadingBuildings={loadingBuildings}
        error={error}
      />
    </>
  );
};

const DataTable = ({ data, columns, loadingBuildings, error }) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const { buildingName, campusId } = useParams();

  return (
    <>
      <div className="mb-5 flex w-full items-center justify-between gap-3"></div>
      {loadingBuildings ? (
        <div className="my-5 rounded-sm border border-stroke bg-white p-4 px-6 dark:border-strokedark dark:bg-boxdark">
          <div className="grid h-[20em] w-full place-content-center">
            <p className="inline-flex items-center gap-4 text-[1.6rem] md:text-[2rem]">
              <SmallLoader width={8} height={8} />
              Loading Floors...
            </p>
          </div>
        </div>
      ) : error ? (
        <div className="my-5 rounded-sm border border-stroke bg-white p-4 px-6 dark:border-strokedark dark:bg-boxdark">
          <div className="grid h-[20em] w-full place-content-center">
            <p className="text-[2rem] font-semibold text-red-700">
              Error: {error}
            </p>
          </div>
        </div>
      ) : (
        !loadingBuildings && (
          <>
            <div className="my-5 rounded-sm border border-stroke bg-white p-4 px-6 dark:border-strokedark dark:bg-boxdark">
              <div className="mb-5 mt-2 justify-between gap-5 md:flex">
                <div className="gap-5 md:flex">
                  <Input
                    placeholder="Search by Floor..."
                    value={table.getColumn("floorName")?.getFilterValue() ?? ""}
                    onChange={(event) =>
                      table
                        .getColumn("floorName")
                        ?.setFilterValue(event.target.value)
                    }
                    className="mb-5 h-[3.3em] w-full !rounded !border-[1.5px] !border-stroke bg-white !px-5 !py-3 text-[1rem] font-medium text-black !outline-none focus:!border-primary active:!border-primary disabled:cursor-default disabled:!bg-whiter dark:!border-form-strokedark dark:!bg-form-input dark:!text-white dark:focus:!border-primary md:mb-0 md:w-[12em]"
                  />
                  <Input
                    placeholder="Search by campus..."
                    value={
                      table.getColumn("campusName")?.getFilterValue() ?? ""
                    }
                    onChange={(event) =>
                      table
                        .getColumn("campusName")
                        ?.setFilterValue(event.target.value)
                    }
                    className="mb-5 h-[3.3em] w-full !rounded !border-[1.5px] !border-stroke bg-white !px-5 !py-3 text-[1rem] font-medium text-black !outline-none focus:!border-primary active:!border-primary disabled:cursor-default disabled:!bg-whiter dark:!border-form-strokedark dark:!bg-form-input dark:!text-white dark:focus:!border-primary md:mb-0 md:w-[18em]"
                  />
                </div>
                <div>
                  <AddFloor buildingName={buildingName} campusId={campusId} />
                </div>
              </div>
              <div className="max-w-full overflow-x-auto">
                <ReuseTable
                  table={table}
                  columns={columns}
                  loadingBuildings={loadingBuildings}
                  error={error}
                />
              </div>

              <div className="flex w-full justify-start py-4 md:items-center md:justify-end">
                <DataTablePagination
                  rowsPerPage={5}
                  totalName={"Floor"}
                  table={table}
                  totalDepartments={table.getFilteredRowModel().rows.length}
                />
              </div>
            </div>
          </>
        )
      )}
    </>
  );
};

export default FloorPage;