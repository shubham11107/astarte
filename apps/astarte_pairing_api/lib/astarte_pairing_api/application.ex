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

defmodule Astarte.Pairing.API.Application do
  use Application

  alias Astarte.Pairing.APIWeb.Metrics

  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  def start(_type, _args) do
    Metrics.PhoenixInstrumenter.setup()
    Metrics.PipelineInstrumenter.setup()
    Metrics.PrometheusExporter.setup()

    # Define workers and child supervisors to be supervised
    children = [
      Astarte.Pairing.APIWeb.Endpoint,
      Astarte.RPC.AMQP.Client
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Astarte.Pairing.API.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    Astarte.Pairing.APIWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
