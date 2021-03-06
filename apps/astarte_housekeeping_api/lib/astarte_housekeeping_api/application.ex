#
# This file is part of Astarte.
#
# Copyright 2017 Ispirata Srl
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

defmodule Astarte.Housekeeping.API.Application do
  use Application

  alias Astarte.Housekeeping.APIWeb.Metrics

  # See http://elixir-lang.org/docs/stable/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    import Supervisor.Spec

    Metrics.PhoenixInstrumenter.setup()
    Metrics.PipelineInstrumenter.setup()
    Metrics.PrometheusExporter.setup()

    # Define workers and child supervisors to be supervised
    children = [
      # Start the endpoint when the application starts
      supervisor(Astarte.Housekeeping.APIWeb.Endpoint, []),
      # Start your own worker by calling: Astarte.Housekeeping.API.Worker.start_link(arg1, arg2, arg3)
      worker(Astarte.RPC.AMQP.Client, [])
    ]

    # See http://elixir-lang.org/docs/stable/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Astarte.Housekeeping.API.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
